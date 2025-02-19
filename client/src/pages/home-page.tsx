import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Resume } from "@shared/schema";
import { FileText, Plus, Settings } from "lucide-react";
import { PaymentDialog } from "@/components/payment-dialog";
import { useState } from "react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { data: resumes } = useQuery<Resume[]>({ queryKey: ["/api/resumes"] });
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username}
            </span>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/generator">
                  <Plus className="mr-2 h-4 w-4" />
                  New Resume
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/templates">
                  <Settings className="mr-2 h-4 w-4" />
                  Templates
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              {resumes?.length === 0 ? (
                <p className="text-sm text-gray-600">No resumes created yet</p>
              ) : (
                <ul className="space-y-2">
                  {resumes?.slice(0, 5).map((resume) => (
                    <li key={resume.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href={`/resume/${resume.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          {resume.name}
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Tier: {user?.isPremium ? "Premium" : "Free"}
                </p>
                <p className="text-sm text-gray-600">
                  Generations Used: {user?.generationCount}/
                  {user?.isPremium ? "∞" : "2"}
                </p>
                {!user?.isPremium && (
                  <Button
                    className="w-full"
                    onClick={() => setShowPremiumDialog(true)}
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PaymentDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        type="subscription"
        name="Premium Subscription"
        price={999}
      />
    </div>
  );
}