import { useAppDispatch } from "@/hooks/hooks";
import { cn } from "@/lib/utils";
import { AuthServices } from "@/services/AuthServices";
import { setCredentials } from "@/store/authSlice";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

export function LoginPageComponent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const email = formData.get("email");

    console.log("Submitting form with data:", email);

    const result = await AuthServices(formData);

    if (result.success) {
      dispatch(
        setCredentials({
          user: {
            name: import.meta.env.VITE_USER_NAME as string,
            email: email as string,
          },
          isAuthenticated: true,
        })
      );
      navigate("/splash", { replace: true });
    } else {
      toast.error(result.message);
    }
  };
  return (
    <div
      className={cn(
        "flex flex-col gap-6 w-full items-center justify-center h-[100dvh]",
        className
      )}
      {...props}
    >
      <Card className=" w-[50%]">
        <CardHeader>
          <div className="flex flex-col items-center">
            <CardTitle>ArchiTec</CardTitle>
            <CardDescription>Soluções para Moveis Projetados</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" name="password" required />
              </Field>
              <Field>
                <Button
                  type="submit"
                  className="bg-lime-400 font-bold hover:bg-lime-600 hover:cursor-pointer"
                >
                  Login
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
