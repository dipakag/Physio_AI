import React from 'react';
import { Flex, Text } from '@radix-ui/themes';

export default function Footer() {
  return (
    <Flex as="footer" px="4" py="2" justify="center" style={{ borderTop: '1px solid #eaeaea' }}>
      <Text size="2" color="gray">© 2024 PhysioAI. All rights reserved.</Text>
    </Flex>
  );
}