import React from 'react';
import { Flex, Text } from '@radix-ui/themes';

export default function Footer() {
  return (
    <Flex asChild>
      <footer style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '8px 16px', 
        borderTop: '1px solid #eaeaea' 
      }}>
        <Text size="2" color="gray">© 2024 PhysioAI. All rights reserved.</Text>
      </footer>
    </Flex>
  );
}