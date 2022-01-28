//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC20.sol";

contract Staking {
    IERC20 public rewardToken;
    IERC20 public stakingToken;

    uint public rewardRate = 1 * 1e12;
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;

    address public _owner;
    mapping(address => bool) private isAdmin;

    uint private _totalSupply;
    mapping(address => uint) private _balances;

    mapping(address => uint) public userRewardPerTokenPaid;
    mapping(address => uint) public rewards;

    mapping(address => uint) private stakedAt;
    uint private availableAfter;

    constructor(address _stakingToken, address _rewardsToken) {
        _owner = msg.sender;
        isAdmin[msg.sender] = true;
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardsToken);
        availableAfter = 10 minutes;
        _totalSupply = 0;
    }

    //core funcs
    function stake(uint256 _value) external updateReward(msg.sender) {
        require(_value > 0, "Cannot stake 0 tokens");
        _totalSupply += _value;
        _balances[msg.sender] = _balances[msg.sender] + _value;
        stakedAt[msg.sender] = block.timestamp;
        stakingToken.transferFrom(msg.sender, address(this), _value);
    }

    function unstake(uint256 _value) external updateReward(msg.sender) {
        require(_value > 0, "Cannot unstake 0 tokens!");
        require(block.timestamp > stakedAt[msg.sender] + availableAfter, "Cannot withdraw yet!");
        _totalSupply = _totalSupply - _value;
        _balances[msg.sender] = _balances[msg.sender] - _value;
        stakingToken.transfer(msg.sender, _value);
    }

    function claim() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.transfer(msg.sender, reward);
        }
    }

    //calculate reward per stored token
    function rewardPerToken() public view returns (uint) {
        if (_totalSupply == 0) {
            return 0;
        }
        return
            rewardPerTokenStored +
            ((rewardRate * (block.timestamp - lastUpdateTime) * 1e18) / _totalSupply);
    }

    //earned reward by the time called
    function earned(address account) public view returns (uint) {
        return
            ((_balances[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    //admin funcs
    function setAdmin(address _who) external onlyOwner {
        isAdmin[_who] = true;
    }

    function unsetAdmin(address _who) external onlyOwner {
        isAdmin[_who] = false;
    }

    function setRewardRate(uint newRate) external onlyAdmin {
        rewardRate = newRate;
    }

    function setWithdrawTimeout(uint newTimeout) external onlyAdmin {
        availableAfter = newTimeout;
    }

    //modifiers
    modifier onlyOwner {
        require(msg.sender == _owner, "You are not the owner!");
        _;
    }

    modifier onlyAdmin {
        require(isAdmin[msg.sender] == true, "You are not the admin!");
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;

        rewards[account] = earned(account);
        userRewardPerTokenPaid[account] = rewardPerTokenStored;
        _;
    }
}