"use client";

import { UseFormReturn } from "react-hook-form";

import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { QuestionFormValues } from "./schema";

interface EssayFieldsProps {
  form: UseFormReturn<QuestionFormValues>;
}

const EssayFields = ({ form }: EssayFieldsProps) => {
  return (
    <Field>
      <FieldLabel>Sample Answer / Rubric (Optional)</FieldLabel>
      <FieldContent>
        <Textarea
          placeholder="Enter sample answer or grading rubric to help with assessment..."
          value={form.watch("sampleAnswer") || ""}
          onChange={(e) => form.setValue("sampleAnswer", e.target.value)}
          rows={5}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Sample answer or grading rubric will help you assess student answers
        </p>
      </FieldContent>
    </Field>
  );
};

export default EssayFields;
