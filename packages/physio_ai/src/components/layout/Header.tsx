import React from 'react';
import { Flex, Text } from '@radix-ui/themes';

export default function Header() {
  return (
    <Flex as="header" px="4" py="2" style={{ borderBottom: '1px solid #eaeaea' }}>
      <Text size="5" weight="bold">PhysioAI</Text>
    </Flex>
  );
}