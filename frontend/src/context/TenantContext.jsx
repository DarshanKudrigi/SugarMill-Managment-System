import { createContext, useState, useEffect } from 'react';

export const TenantContext = createContext(null);

const DEFAULT_TENANT = {
  id: 'tenant-001',
  name: 'Sunrise Sugar Mills',
  logo: null,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  financialYearStart: '2026-04-01',
};

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(DEFAULT_TENANT);

  // In production: fetch tenant config from API based on subdomain / user profile
  // useEffect(() => { api.get('/tenant/config').then(r => setTenant(r.data)); }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}
