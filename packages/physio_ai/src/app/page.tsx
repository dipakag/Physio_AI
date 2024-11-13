'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Camera from '@/components/sensors/Camera';
import MovementGraph from '@/components/visualization/MovementGraph';
import { Card, Grid, Text, Heading, Flex } from '@radix-ui/themes';

interface AnalysisMetrics {
  angle: number;
  form_quality: number;
  repetitions: number;
}

interface AnalysisData {
  status: string;
  metrics: AnalysisMetrics;
  points: [number, number][];
}

export default function DashboardPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const handleAnalysisData = (data: AnalysisData) => {
    setAnalysisData(data);
  };

  return (
    <DashboardLayout>
      <Heading size="8" mb="4">Movement Analysis</Heading>
      
      <Grid columns="2" gap="4" mb="4">
        <Card>
          <Heading size="4" mb="2">Camera Feed</Heading>
          <Camera onAnalysisData={handleAnalysisData} />
        </Card>
        <Card>
          <Heading size="4" mb="2">Movement Trajectory</Heading>
          <MovementGraph />
        </Card>
      </Grid>

      <Grid columns="1" gap="4">
        <Card>
          <Heading size="4" mb="2">Analysis</Heading>
          <Flex direction="column" gap="3">
            {analysisData ? (
              <>
                <Flex gap="2">
                  <Text weight="bold">Status:</Text>
                  <Text>{analysisData.status}</Text>
                </Flex>
                
                <Flex direction="column" gap="2">
                  <Text weight="bold">Metrics:</Text>
                  <Flex direction="column" gap="1" className="ml-4">
                    <Text>Angle: {analysisData.metrics.angle}°</Text>
                    <Text>Form Quality: {(analysisData.metrics.form_quality * 100).toFixed(1)}%</Text>
                    <Text>Repetitions: {analysisData.metrics.repetitions}</Text>
                  </Flex>
                </Flex>

                <Flex direction="column" gap="2">
                  <Text weight="bold">Movement Points:</Text>
                  <div className="ml-4 max-h-40 overflow-y-auto">
                    {analysisData.points.map((point, index) => (
                      <Text key={index} size="2">
                        Point {index + 1}: ({point[0]}, {point[1]})
                      </Text>
                    ))}
                  </div>
                </Flex>
              </>
            ) : (
              <Text size="2" color="gray">
                Waiting for movement data...
              </Text>
            )}
          </Flex>
        </Card>
      </Grid>
    </DashboardLayout>
  );
} 