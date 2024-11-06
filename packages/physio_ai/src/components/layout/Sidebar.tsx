import React from 'react';
import { Flex, Button } from '@radix-ui/themes';
import { HomeIcon, PersonIcon, CalendarIcon } from '@radix-ui/react-icons';

export default function Sidebar() {
  return (
    <aside>
      <Flex 
        direction="column" 
        p="4" 
        gap="2"
        style={{ 
          borderRight: '1px solid #eaeaea',
          width: '240px'
        }}
      >
        <Button variant="ghost" style={{ justifyContent: 'flex-start' }}>
          <HomeIcon /> Home
        </Button>
        <Button variant="ghost" style={{ justifyContent: 'flex-start' }}>
          <PersonIcon /> Patients
        </Button>
        <Button variant="ghost" style={{ justifyContent: 'flex-start' }}>
          <CalendarIcon /> Appointments
        </Button>
      </Flex>
    </aside>
  );
}