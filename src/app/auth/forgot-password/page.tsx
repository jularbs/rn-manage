import { ForgotPasswordForm } from "@/components/Forms/AuthForms/ForgotPasswordForm";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
