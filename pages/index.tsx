import { withAuth } from 'lib/auth';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import * as React from 'react';

const Home = () => {
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
export const getServerSideProps: GetServerSideProps = withAuth(null, { logoutRequired: true });
export default Home;
