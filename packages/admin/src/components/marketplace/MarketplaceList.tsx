import React from 'react';

export default function MarketplaceList() {
  const [apis, setApis] = React.useState<any[]>([]);
  React.useEffect(() => {
    fetch('/marketplace').then(r => r.json()).then(data => setApis(data.apis || []));
  }, []);
  return (
    <div>
      <h2>API Marketplace</h2>
      <ul>
        {apis.map(api => (
          <li key={api.id}>
            <b>{api.name}</b> (Tier: {api.tier}) [${api.price}]
            <br />Tags: {api.tags && api.tags.join(', ')}
            <br /><a href={api.docs} target="_blank" rel="noopener noreferrer">Docs</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
