import React from 'react';
import { Container, Flex } from '@radix-ui/themes';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>
      <Header />
      <Flex flexGrow="1">
        <Sidebar />
        <Container size="4" p="4">
          {children}
        </Container>
      </Flex>
      <Footer />
    </Flex>
  );
}