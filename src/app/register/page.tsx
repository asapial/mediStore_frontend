

import { SignupForm } from "@/components/signup-form"
import SectionContainer from "@/utils/SectionContainer"
import RegisterAnimationClient from "./animationClient"


export default function SignupPage() {
  return (

    <SectionContainer>
      <div className="grid  lg:grid-cols-2 border border-primary shadow rounded-2xl">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            {/* <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Acme Inc.
            </a> */}
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <SignupForm />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block rounded-r-2xl ">
          {/* <img
            src="/placeholder.svg"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale roun"
          /> */}

          <RegisterAnimationClient></RegisterAnimationClient>
        </div>
      </div>
    </SectionContainer>
  )
}
