import React from 'react';

export default function UserManagement() {
  return (
    <div style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>User Management</h2>
      <p>Placeholder user management UI. Connect to real user store to manage accounts and tiers.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>User</th>
            <th style={{ textAlign: 'left' }}>Email</th>
            <th style={{ textAlign: 'left' }}>Tier</th>
            <th style={{ textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Example User</td>
            <td>user@example.com</td>
            <td>Standard</td>
            <td><button>Promote</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
