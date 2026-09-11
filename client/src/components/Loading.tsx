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
      <CardHeader className="justify-ends flex-row items-center gap-4">
        <CardTitle className="text-lg">Loading...</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>please wait</CardDescription>
      </CardContent>
    </Card>
  );
};

export default Loading;
