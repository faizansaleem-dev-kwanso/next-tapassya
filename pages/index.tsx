import { withAuth } from 'lib/auth';
import Link from 'next/link';
import * as React from 'react';

const Home = (): JSX.Element => {
  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <h1>Landing Page</h1>

      <p>
        Click{' '}
        <Link href="/login">
          <a>here</a>
        </Link>{' '}
        to go to the dashboard
      </p>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};
export const getServerSideProps = withAuth(null, { logoutRequired: true });
export default Home;
