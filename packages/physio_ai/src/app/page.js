import DashboardLayout from '@/components/layout/DashboardLayout';
import Camera from '@/components/sensors/Camera';
import MovementGraph from '@/components/visualization/MovementGraph';
import { Card, Grid, Text, Heading } from '@radix-ui/themes';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Heading size="8" mb="4">Movement Analysis</Heading>
      
      <Grid columns="1" gap="4" mb="4">
        <Card>
          <Heading size="4" mb="2">Camera Feed</Heading>
          <Camera />
        </Card>
      </Grid>

      <Grid columns="2" gap="4">
        <Card>
          <Heading size="4" mb="2">Movement Trajectory</Heading>
          <MovementGraph />
        </Card>
        <Card>
          <Heading size="4">Analysis</Heading>
          <Text size="2" color="gray">
            Real-time movement analysis will appear here
          </Text>
        </Card>
      </Grid>
    </DashboardLayout>
  );
}