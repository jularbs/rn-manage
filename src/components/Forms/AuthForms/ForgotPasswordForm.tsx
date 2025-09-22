"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoaderCircle } from "lucide-react"
import { toast } from "sonner"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="p-0 overflow-hidden">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">Forgot Password</h1>
                <p className="text-sm text-muted-foreground">
                  Please enter your email to start retreiving your account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <LoaderCircle className={cn("animate-spin", loading ? "inline-block" : "hidden")} />
                Send Instructions to email
              </Button>
              <div className="text-sm text-center">
                Would like to register instead?{" "}
                <a href="/auth/register" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
