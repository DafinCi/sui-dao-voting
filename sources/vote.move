module vote::vote;

use std::string::String;
use sui::clock::{Self, Clock};
use sui::event;

const ERROR_PROPOSAL_NOT_FOUND: u64 = 1;
const ERROR_ALREADY_VOTED: u64 = 2;
const ERROR_INVALID_DEADLINE: u64 = 4;
const ERROR_ZERO_OPTION: u64 = 5;
const ERROR_INVALID_OPTION_INDEX: u64 = 6;

public struct Proposal has store {
    id: u64,
    title: String,
    description: String,
    options: vector<String>,
    votes: vector<u64>,
    deadline_ms: u64,
    voters: vector<address>,
}

public struct DAOStorage has key {
    id: UID,
    proposals: vector<Proposal>,
    next_id: u64,
}

public struct ProposalCreated has copy, drop {
    id: u64,
    title: String,
}

public struct VoteCast has copy, drop {
    proposal_id: u64,
    voter: address,
    option_index: u64,
}

fun init(ctx: &mut TxContext) {
    create_dao(ctx);
}

public fun create_dao(ctx: &mut TxContext) {
    let dao = DAOStorage {
        id: object::new(ctx),
        proposals: vector::empty<Proposal>(),
        next_id: 0,
    };
    transfer::share_object(dao);
}

public fun create_proposal(
    dao: &mut DAOStorage,
    title: String,
    description: String,
    options: vector<String>,
    deadline_ms: u64,
    clock: &Clock,
) {
    let now = clock::timestamp_ms(clock);

    if (vector::length(&options) == 0) {
        abort ERROR_ZERO_OPTION
    };
    if (deadline_ms <= now) {
        abort ERROR_INVALID_DEADLINE
    };

    let option_count = vector::length(&options);

    let mut votes = vector::empty<u64>();
    let mut i = 0;
    while (i < option_count) {
        vector::push_back(&mut votes, 0);
        i = i + 1;
    };

    let id = dao.next_id;

    let proposal = Proposal {
        id,
        title,
        description,
        options,
        votes,
        deadline_ms,
        voters: vector::empty<address>(),
    };

    vector::push_back(&mut dao.proposals, proposal);
    dao.next_id = id + 1;

    event::emit(ProposalCreated { id, title });
}

public fun vote(
    dao: &mut DAOStorage,
    proposal_id: u64,
    option_index: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    let voter = sui::tx_context::sender(ctx);

    let mut found = false;
    let mut proposal_idx = 0;
    let len = vector::length(&dao.proposals);

    while (proposal_idx < len) {
        if (dao.proposals[proposal_idx].id == proposal_id) {
            found = true;
            break
        };
        proposal_idx = proposal_idx + 1;
    };

    if (!found) {
        abort ERROR_PROPOSAL_NOT_FOUND
    };

    let proposal = vector::borrow_mut(&mut dao.proposals, proposal_idx);

    let now = clock::timestamp_ms(clock);

    if (proposal.deadline_ms <= now) {
        abort ERROR_INVALID_DEADLINE
    };

    let mut k = 0;
    let voters_len = vector::length(&proposal.voters);
    while (k < voters_len) {
        if (*vector::borrow(&proposal.voters, k) == voter) {
            abort ERROR_ALREADY_VOTED
        };
        k = k + 1;
    };

    let options_len = vector::length(&proposal.options);
    if (option_index >= options_len) {
        abort ERROR_INVALID_OPTION_INDEX
    };

    let vote_count = vector::borrow_mut(&mut proposal.votes, option_index);
    *vote_count = *vote_count + 1;

    vector::push_back(&mut proposal.voters, voter);

    event::emit(VoteCast {
        proposal_id,
        voter,
        option_index,
    });
}

public fun get_proposals(dao: &DAOStorage): &vector<Proposal> {
    &dao.proposals
}

public fun get_proposal_results(dao: &DAOStorage, proposal_id: u64): vector<u64> {
    let mut i = 0;
    let mut found = false;
    let len = vector::length(&dao.proposals);

    while (i < len) {
        if (dao.proposals[i].id == proposal_id) {
            found = true;
            break
        };
        i = i + 1;
    };

    if (!found) {
        abort ERROR_PROPOSAL_NOT_FOUND
    };

    *&dao.proposals[i].votes
}
