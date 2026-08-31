import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/card";

const Loading = () => {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-ends gap-4">
        <CardTitle className="text-lg">Loading...</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>please wait</CardDescription>
      </CardContent>
    </Card>
  );
};

export default Loading;
