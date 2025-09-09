package policy.consent

import future.keywords

# Test: allow when consent contains scope and not expired
test_allow_valid_consent {
  input := {
    "request": {"scope": "read:accounts"},
    "consent": {"scopes": ["read:accounts"], "exp": 32503680000},
    "now": 1694246400
  }
  allow with input as input
}

# Test: deny when scope not present
test_deny_missing_scope {
  input := {
    "request": {"scope": "write:accounts"},
    "consent": {"scopes": ["read:accounts"], "exp": 32503680000},
    "now": 1694246400
  }
  not allow with input as input
}

# Test: deny when consent expired
test_deny_expired {
  input := {
    "request": {"scope": "read:accounts"},
    "consent": {"scopes": ["read:accounts"], "exp": 1600000000},
    "now": 1694246400
  }
  not allow with input as input
}
