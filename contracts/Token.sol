//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC20.sol";

contract Token is IERC20 {
    string public override name;
    string public override symbol;
    uint8 constant public override decimals = 18;
    uint256 public override totalSupply;
    address private owner;

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    mapping (address => uint256) private balances;
    mapping (address => mapping (address => uint256)) private allowed;

    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner!");
        _;
    }

    constructor (string memory _name, string memory _symbol, uint256 _total) {
        name = _name;
        symbol = _symbol;
        totalSupply = _total;
        balances[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    function balanceOf(address _owner) external view override returns (uint256 balance){
        return balances[_owner];
    }

    function transfer(address _to, uint256 _value) external override returns (bool success){
        require(_value <= balances[msg.sender], "Insufficient balance!");
        balances[msg.sender] = balances[msg.sender] - _value;
        balances[_to] = balances[_to] + _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) external override returns (bool success){
        require(_value <= balances[_from], "Insufficient balance!");
        require(_value <= allowed[_from][msg.sender], "Insufficient allowance!");
        balances[_from] = balances[_from] - _value;
        allowed[_from][msg.sender] = allowed[_from][msg.sender] - _value;
        balances[_to] = balances[_to] + _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)  external override returns (bool success){
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) external view override returns (uint remaining){
        return allowed[_owner][_spender];
    }

    function _mint(address _to, uint256 _value) public onlyOwner returns (bool success) {
        balances[_to] += _value;
        totalSupply += _value;
        emit Transfer(address(0), _to, _value);
        return true;
    }

    function _burn(address _to, uint256 _value) public onlyOwner returns (bool success) {
        require(_value <= balances[_to], "Cannot burn more than balance!");
        totalSupply -= _value;
        balances[_to] -= _value;
        emit Transfer(_to, address(0), _value);
        return true;
    }
}