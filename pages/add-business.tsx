import React, { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Helmet } from "react-helmet";
import { Loader2, Info } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "../components/Form";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Textarea } from "../components/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/Select";
import { useAddBusiness } from "../helpers/useBusinessApi";
import { BusinessCategoryArrayValues } from "../helpers/schema";
import styles from "./add-business.module.css";

// Define the schema for the form
// We reuse the logic from the endpoint schema but adapt it for the form UI
const formSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.enum(BusinessCategoryArrayValues, {
    required_error: "Please select a category",
  }),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  location: z.string().optional(),
  phone: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddBusinessPage() {
  const navigate = useNavigate();
  const addBusinessMutation = useAddBusiness();
  const [confirmed, setConfirmed] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "other", // Default to 'other'
      website: "",
      location: "",
      phone: "",
      contactEmail: "",
    },
    schema: formSchema,
  });

  const onSubmit = (values: FormValues) => {
    // Clean up empty strings for optional fields if necessary, 
    // though our schema handles empty strings for website via literal union.
    // For other optional fields, empty string is fine or can be converted to undefined.
    
    addBusinessMutation.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        category: values.category,
        website: values.website || undefined,
        location: values.location || undefined,
        phone: values.phone || undefined,
        contactEmail: values.contactEmail || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            "Business submitted for review! Our team will verify and publish it shortly."
          );
          // Redirect to home after a short delay to allow toast to be seen
          setTimeout(() => {
            navigate("/");
          }, 2000);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to add business. Please try again."
          );
        },
      }
    );
  };

  // Helper to format category names (e.g., "real_estate" -> "Real Estate")
  const formatCategory = (cat: string) => {
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <Helmet>
        <title>Add Business | TrueLency</title>
        <meta
          name="description"
          content="Add a new business to TrueLency to help others find reliable insights."
        />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Add a Business</h1>
            <p className={styles.subtitle}>
              Submit a business for review. All submissions are moderated before
              appearing publicly.
            </p>
          </div>

          <div className={styles.disclaimer}>
            <Info className={styles.disclaimerIcon} size={20} />
            <p className={styles.disclaimerText}>
              Your submission will be reviewed by our team before it appears
              publicly. The submitter is responsible for the accuracy of all
              information provided.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={styles.formGrid}>
              <FormItem name="name">
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Acme Corp"
                    value={form.values.name}
                    onChange={(e) =>
                      form.setValues((prev) => ({ ...prev, name: e.target.value }))
                    }
                    disabled={addBusinessMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem name="category">
                <FormLabel>Category</FormLabel>
                <Select
                  value={form.values.category}
                  onValueChange={(val) =>
                    form.setValues((prev) => ({ ...prev, category: val as any }))
                  }
                  disabled={addBusinessMutation.isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BusinessCategoryArrayValues.map((category) => (
                      <SelectItem key={category} value={category}>
                        {formatCategory(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem name="description">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Briefly describe the business..."
                    value={form.values.description}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    disabled={addBusinessMutation.isPending}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>

              <FormItem name="website">
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    value={form.values.website}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                    disabled={addBusinessMutation.isPending}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>

              <FormItem name="location">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. New York, NY"
                    value={form.values.location}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    disabled={addBusinessMutation.isPending}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>

              <FormItem name="phone">
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. +1 (555) 000-0000"
                    value={form.values.phone}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={addBusinessMutation.isPending}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>

              <FormItem name="contactEmail">
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="e.g. contact@yourbusiness.com"
                    value={form.values.contactEmail}
                    onChange={(e) =>
                      form.setValues((prev) => ({
                        ...prev,
                        contactEmail: e.target.value,
                      }))
                    }
                    disabled={addBusinessMutation.isPending}
                  />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>

              {/* Not a FormItem because it's not in the schema anymore */}
              <div className={styles.checkboxContainer}>
                <Checkbox
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={addBusinessMutation.isPending}
                  id="confirmation-checkbox"
                />
                <label
                  htmlFor="confirmation-checkbox"
                  className={styles.checkboxLabel}
                >
                  I confirm the information provided is accurate and I am
                  responsible for its accuracy.
                </label>
              </div>

              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  disabled={addBusinessMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={addBusinessMutation.isPending || !confirmed}
                >
                  {addBusinessMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Adding...
                    </>
                  ) : (
                    "Add Business"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}