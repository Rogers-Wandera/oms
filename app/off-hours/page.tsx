import { Container, Title, Text, Button, Stack, Card } from "@mantine/core";
import { Clock } from "lucide-react";
import Link from "next/link";

export default function OutsideWorkingHours() {
  return (
    <Container size="sm" py={100}>
      <Card shadow="md" padding="xl" radius="md" withBorder>
        <Stack align="center" gap="lg">
          <Clock size={48} color="red" />
          <Title order={2}>Outside Working Hours</Title>
          <Text ta="center" c="dimmed">
            The system is restricted to official working hours.
            <br />
            <strong>Mon-Fri:</strong> 08:00 - 17:00
            <br />
            <strong>Saturday:</strong> 09:00 - 14:00
          </Text>
          <Text size="sm" c="red" fw={500}>
            If you are currently working overtime, please ensure you clocked in
            before the session restricted.
          </Text>
          <Button variant="light" color="blue" component={Link} href="/login">
            Back to Login
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
