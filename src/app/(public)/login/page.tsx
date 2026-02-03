
import { LoginForm } from "@/components/login-form"
import LoginAnimationClient from "./loginAnimationClient"
import SectionContainer from "@/utils/SectionContainer"

export default function LoginPage() {
  return (
    <SectionContainer>

 
    <div className="grid min-h-svh lg:grid-cols-2 border border-primary shadow rounded-2xl">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">

        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block rounded-r-2xl">
        <LoginAnimationClient></LoginAnimationClient>
      </div>
    </div>
       </SectionContainer>
  )
}
