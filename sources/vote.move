module vote::vote;

use std::string::String;
use std::vector;
use sui::clock;
use sui::event;
use sui::tx_context::TxContext;

const ERROR_PROPOSAL_NOT_FOUND: u64 = 1;
const ERROR_ALREADY_VOTED: u64 = 2;
const ERROR_NOT_AUTHORIZED: u64 = 3;
const ERROR_INVALID_DEADLINE: u64 = 4;
const ERROR_ZERO_OPTION: u64 = 5;

struct Proposal has store {
    id: u64,
    title: String,
    description: String,
    options: vector<String>,
    votes: vector<u64>,
    deadline_ms: u64,
}

struct DAOStorage has key, store {
    proposals: vector<Proposal>,
    next_id: u64,
}

public fun init(ctx: &mut TxContext) {
    let list = vector::empty<Proposal>();

    let dao = DAOStorage {
        proposals: list,
        next_id: 0,
    };
    sui::tx_context::transfer::share_object(dao, ctx);
}
