import { ReviewCard } from "./ReviewCard";
import { Form, FormItem, FormLabel, FormControl, FormMessage, useForm } from "./Form";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Button } from "./Button";
import { Separator } from "./Separator";
import { Skeleton } from "./Skeleton";
import { useAddReview } from "../helpers/useBusinessApi";
import { useI18n } from "../helpers/i18n";
import { Selectable } from "kysely";
import { Reviews } from "../helpers/schema";
import { z } from "zod";
import { toast } from "sonner";
import styles from "./BusinessReviewsTab.module.css";

interface BusinessReviewsTabProps {
  businessId: number;
  reviews: Selectable<Reviews>[] | undefined;
  isLoading: boolean;
}

const reviewFormSchema = z.object({
  reviewerName: z.string().optional(),
  rating: z.coerce.number().min(1).max(5),
  content: z.string().min(10, "Review must be at least 10 characters"),
});

export const BusinessReviewsTab = ({ businessId, reviews, isLoading }: BusinessReviewsTabProps) => {
  const { t } = useI18n();
  const addReviewMutation = useAddReview();

  const form = useForm({
    defaultValues: {
      reviewerName: "",
      rating: 5,
      content: "",
    },
    schema: reviewFormSchema,
  });

  const onSubmit = (data: z.infer<typeof reviewFormSchema>) => {
    addReviewMutation.mutate(
      {
        businessId,
        reviewerName: data.reviewerName || undefined,
        rating: data.rating,
        content: data.content,
      },
      {
        onSuccess: () => {
          toast.success(t("business.reviewAdded"));
          form.setValues({
            reviewerName: "",
            rating: 5,
            content: "",
          });
        },
        onError: (error) => {
          toast.error(error.message || t("business.reviewFailed"));
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.reviewsList}>
          <Skeleton style={{ height: "12rem", borderRadius: "var(--radius)" }} />
          <Skeleton style={{ height: "12rem", borderRadius: "var(--radius)" }} />
          <Skeleton style={{ height: "12rem", borderRadius: "var(--radius)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.reviewsList}>
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        ) : (
          <div className={styles.emptyState}>
            <p>{t("business.beFirstToReview")}</p>
          </div>
        )}
      </div>

      <Separator />

      <div className={styles.formSection}>
        <h3 className={styles.formTitle}>{t("business.addReview")}</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
            <FormItem name="reviewerName">
              <FormLabel>{t("business.yourName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("business.yourName")}
                  value={form.values.reviewerName}
                  onChange={(e) =>
                    form.setValues((prev) => ({ ...prev, reviewerName: e.target.value }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="rating">
              <FormLabel>{t("business.rating")}</FormLabel>
              <FormControl>
                <Select
                  value={String(form.values.rating)}
                  onValueChange={(value) =>
                    form.setValues((prev) => ({ ...prev, rating: parseInt(value, 10) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("business.rating")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="2">2 - Poor</SelectItem>
                    <SelectItem value="1">1 - Terrible</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>

            <FormItem name="content">
              <FormLabel>{t("business.yourReview")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("business.yourReview")}
                  value={form.values.content}
                  onChange={(e) =>
                    form.setValues((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <Button
              type="submit"
              disabled={addReviewMutation.isPending}
              className={styles.submitButton}
            >
              {addReviewMutation.isPending ? t("business.submitting") : t("business.submitReview")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};