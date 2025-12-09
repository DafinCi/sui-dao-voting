module vote::vote;

use std::string::String;
use sui::clock::{Self, Clock};
use sui::event;

// --- ERROR CONSTANTS ---
const ERROR_PROPOSAL_NOT_FOUND: u64 = 1;
const ERROR_ALREADY_VOTED: u64 = 2;
const ERROR_INVALID_DEADLINE: u64 = 4;
const ERROR_ZERO_OPTION: u64 = 5;
const ERROR_INVALID_OPTION_INDEX: u64 = 6;

// --- STRUCTS ---

// 1. Admin Capability (Kunci Khusus Admin)
public struct AdminCap has key, store {
    id: UID,
}

// 2. Proposal Struct
public struct Proposal has drop, store {
    // Tambah 'drop' agar bisa dihapus
    id: u64,
    title: String,
    description: String,
    options: vector<String>,
    votes: vector<u64>,
    deadline_ms: u64,
    voters: vector<address>,
}

// 3. Storage Utama
public struct DAOStorage has key {
    id: UID,
    proposals: vector<Proposal>,
    next_id: u64,
}

// --- EVENTS ---
public struct ProposalCreated has copy, drop { id: u64, title: String }
public struct ProposalUpdated has copy, drop { id: u64, title: String } // Event baru
public struct ProposalDeleted has copy, drop { id: u64 } // Event baru

public struct VoteCast has copy, drop {
    proposal_id: u64,
    voter: address,
    option_index: u64,
}

// --- INIT ---
fun init(ctx: &mut TxContext) {
    // 1. Buat DAO Storage (Shared Object)
    let dao = DAOStorage {
        id: object::new(ctx),
        proposals: vector::empty<Proposal>(),
        next_id: 0,
    };
    transfer::share_object(dao);

    // 2. Buat AdminCap dan kirim ke Deployer (Anda)
    let admin_cap = AdminCap { id: object::new(ctx) };
    transfer::transfer(admin_cap, ctx.sender());
}

// --- ADMIN ONLY FUNCTIONS (C-R-U-D) ---

// 1. CREATE (Butuh AdminCap)
public fun create_proposal(
    _: &AdminCap, // <--- Gembok: Hanya pemilik AdminCap yang bisa panggil
    dao: &mut DAOStorage,
    title: String,
    description: String,
    options: vector<String>,
    deadline_ms: u64,
    clock: &Clock,
) {
    let now = clock.timestamp_ms();

    assert!(options.length() > 0, ERROR_ZERO_OPTION);
    assert!(deadline_ms > now, ERROR_INVALID_DEADLINE);

    let option_count = options.length();
    let mut votes = vector::empty<u64>();
    let mut i = 0;
    while (i < option_count) {
        votes.push_back(0);
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

    dao.proposals.push_back(proposal);
    dao.next_id = id + 1;

    event::emit(ProposalCreated { id, title });
}

// 2. UPDATE (Butuh AdminCap) - Bisa edit Judul, Deskripsi, Deadline
public fun update_proposal(
    _: &AdminCap,
    dao: &mut DAOStorage,
    proposal_id: u64,
    new_title: String,
    new_description: String,
    new_deadline_ms: u64,
) {
    let mut found = false;
    let mut i = 0;
    let len = dao.proposals.length();

    while (i < len) {
        if (dao.proposals[i].id == proposal_id) {
            found = true;
            break
        };
        i = i + 1;
    };

    assert!(found, ERROR_PROPOSAL_NOT_FOUND);

    let proposal = &mut dao.proposals[i];
    proposal.title = new_title;
    proposal.description = new_description;
    proposal.deadline_ms = new_deadline_ms;

    event::emit(ProposalUpdated { id: proposal_id, title: new_title });
}

// 3. DELETE (Butuh AdminCap)
public fun delete_proposal(_: &AdminCap, dao: &mut DAOStorage, proposal_id: u64) {
    let mut found = false;
    let mut i = 0;
    let len = dao.proposals.length();

    while (i < len) {
        if (dao.proposals[i].id == proposal_id) {
            found = true;
            break
        };
        i = i + 1;
    };

    assert!(found, ERROR_PROPOSAL_NOT_FOUND);

    // Hapus dari vector menggunakan swap_remove (efisien)
    let _removed_proposal = dao.proposals.swap_remove(i);

    event::emit(ProposalDeleted { id: proposal_id });
}

// --- PUBLIC FUNCTIONS (VOTE & READ) ---

// 4. VOTE (1 Orang 1 Suara - permissionless tapi dibatasi logic)
public fun vote(
    dao: &mut DAOStorage,
    proposal_id: u64,
    option_index: u64,
    clock: &Clock,
    ctx: &TxContext,
) {
    let voter = ctx.sender();

    // Cari Proposal
    let mut found = false;
    let mut proposal_idx = 0;
    let len = dao.proposals.length();

    while (proposal_idx < len) {
        if (dao.proposals[proposal_idx].id == proposal_id) {
            found = true;
            break
        };
        proposal_idx = proposal_idx + 1;
    };

    assert!(found, ERROR_PROPOSAL_NOT_FOUND);

    let proposal = &mut dao.proposals[proposal_idx];
    let now = clock.timestamp_ms();

    assert!(proposal.deadline_ms > now, ERROR_INVALID_DEADLINE);

    // Cek apakah voter sudah vote (1 orang 1 suara)
    let mut k = 0;
    let voters_len = proposal.voters.length();
    while (k < voters_len) {
        if (*proposal.voters.borrow(k) == voter) {
            abort ERROR_ALREADY_VOTED
        };
        k = k + 1;
    };

    let options_len = proposal.options.length();
    assert!(option_index < options_len, ERROR_INVALID_OPTION_INDEX);

    // Update Vote
    let vote_count = &mut proposal.votes[option_index];
    *vote_count = *vote_count + 1;

    proposal.voters.push_back(voter);

    event::emit(VoteCast {
        proposal_id,
        voter,
        option_index,
    });
}

// --- GETTERS ---
public fun get_proposals(dao: &DAOStorage): &vector<Proposal> {
    &dao.proposals
}

public fun get_proposal_results(dao: &DAOStorage, proposal_id: u64): vector<u64> {
    let mut i = 0;
    let mut found = false;
    let len = dao.proposals.length();

    while (i < len) {
        if (dao.proposals[i].id == proposal_id) {
            found = true;
            break
        };
        i = i + 1;
    };

    assert!(found, ERROR_PROPOSAL_NOT_FOUND);
    *&dao.proposals[i].votes
}

// package =  0x171662eaaafb29c95f8329545f6f0548423568d69a55b526fce287434d2092a3
// shared obj = 0xe0d944f57ad9f0291acf7ed46eddecb79482a0290b6a4d4ce062a3c17c05460b
// admin_id = 0x924c047575c952e9fc34cbd71962bd074eb90ced2290984267771a97f70f7dcf
