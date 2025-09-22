import { RegistrationForm } from "@/components/Forms/AuthForms/RegistrationForm";

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <RegistrationForm />
      </div>
    </div>
  )
}
