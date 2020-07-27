const ERROR_CODES = {
    COMMON: {
        invalid_api: 'invalid_api',
        field_missing: 'field_missing',
        already_existed: 'already existed',
        server_error: 'internal_server_error',
        invalid_type: 'invalid_type',
        invalid_domain: 'invalid_domain',
        invalid_body: 'invalid_body',
        entities_not_associated: 'entities_not_associated',
        already_done: 'already_done',
        invalid_state: 'invalid_state',
        donation_volunteer_not_found: "donation_volunteer_not_found",
        payment_work_pending: "payment_work_pending",
        not_found: "results_not_found",
        invalid_password: "Invalid_Password",
        invalid_email: "Invalid_email"
    },
    AUTH: {
        invalid_format: 'auth_password_invalid_format',
        key_invalid_format: 'invalid_format',
        key_invalid_params: 'invalid_params',
        invalid_email: 'auth_email_invalid_format',
        invalid_password: 'auth_incorrect_password',
        invalid_account: 'auth_account_invalid',
        account_exists: 'account_exists',
        token_expired: 'token_expired',
        token_invalid: 'auth_token_invalid',
        token_required: 'token_required',
        invalid_role: 'invalid_role',
        auth_same_password: "auth_same_password",
        role_already_assigned: 'role_already_assigned',
        account_not_exist: "account_not_exist",
        invalid_private_key: "invalid_private_key",
        trust_not_generated: "trust_not_generated",
        already_deleted: "already_deleted",
        already_started: "already_started",
        insufficient_balance: "insufficient_balance",
        password_mismatch: "auth_password_mismatch",
        invalid_user: "auth_invalid_user",
        update_denied: "update_denied"
    }
};

module.exports = {
    ERROR_CODES
}
