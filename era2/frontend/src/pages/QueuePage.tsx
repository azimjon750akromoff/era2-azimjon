import { GenerationQueue } from "@/widgets/generation-queue";
import { useNavigate } from "@/shared/routing";

export default function QueuePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <GenerationQueue
        onNavigateToQueue={() => navigate("/queue")}
      />
    </div>
  );
}
