"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { type QuizDetailsFormValues, quizDetailsSchema } from "./schema";

interface QuizDetailsFormProps {
  defaultValues?: QuizDetailsFormValues;
  onSubmit: (data: QuizDetailsFormValues) => Promise<void>;
  isLoading?: boolean;
}

const QuizDetailsForm = ({
  defaultValues,
  onSubmit,
  isLoading,
}: QuizDetailsFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuizDetailsFormValues>({
    resolver: zodResolver(quizDetailsSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data: QuizDetailsFormValues) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Quiz Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Enter quiz name"
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Quiz Description</Label>
          <Textarea
            id="description"
            placeholder="Enter quiz description (optional)"
            rows={4}
            disabled={isLoading}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default QuizDetailsForm;
