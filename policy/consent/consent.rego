package policy.consent

# Consent enforcement example
# Input shape expected by the rule:
# {
#   "request": {"scope": "read:accounts"},
#   "consent": {"scopes": ["read:accounts"], "exp": 1699999999},
#   "now": 1694246400
# }

default allow = false

# allow when the consent contains the requested scope and is not expired
allow {
  requested := input.request.scope
  scopes := input.consent.scopes
  some i
  scopes[i] == requested
  not expired
}

expired {
  # consent expired if exp is present and now >= exp
  now := input.now
  exp := input.consent.exp
  now >= exp
}
