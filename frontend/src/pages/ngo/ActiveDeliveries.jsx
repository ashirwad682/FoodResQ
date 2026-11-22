import React from 'react';
import { IncomingDeliveriesOtpSection } from '../../components/ngo/IncomingDeliveriesOtpSection';

export const ActiveDeliveries = () => {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <IncomingDeliveriesOtpSection />
    </div>
  );
};
