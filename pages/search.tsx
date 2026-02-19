import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Filter, Plus, AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { Skeleton } from "../components/Skeleton";
import { BusinessCard } from "../components/BusinessCard";
import { useSearchBusinesses, useQuickAddBusiness } from "../helpers/useBusinessApi";
import { useI18n } from "../helpers/i18n";
import { BusinessCategoryArrayValues } from "../helpers/schema";
import { useDebounce } from "../helpers/useDebounce";
import styles from "./search.module.css";

export default function SearchPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Debounce query to avoid too many requests while typing
  const debouncedQuery = useDebounce(query, 500);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (category && category !== "_all") params.set("category", category);
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, category, setSearchParams]);

  const { data: businesses, isLoading, isError } = useSearchBusinesses(
    debouncedQuery, 
    category === "_all" ? undefined : category
  );

  const quickAddMutation = useQuickAddBusiness();

  const handleAddBusiness = async () => {
    if (!query.trim()) return;

    try {
      const result = await quickAddMutation.mutateAsync({
        name: query.trim(),
        category: category && category !== "_all" ? category as any : undefined,
      });

      if (result.blocked) {
        // Handle blocked scenarios
        if (result.riskLevel === "high" && result.duplicateWarning) {
          // Duplicate found
          toast.info(result.duplicateWarning, {
            description: "This business already exists. Click to view it.",
            action: result.business ? {
              label: "View Business",
              onClick: () => navigate(`/business/${result.business!.id}`),
            } : undefined,
          });
        } else {
          // Unsafe content
          toast.error("Cannot add business", {
            description: result.duplicateWarning || "The business name contains unsafe keywords.",
          });
        }
      } else if (result.business) {
        // Success - business created
        toast.success("Business added successfully!", {
          description: "Your business is pending verification.",
          icon: <ShieldCheck size={20} />,
        });
        navigate(`/business/${result.business.id}`);
      }
    } catch (error) {
      toast.error("Failed to add business", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("search.title")}</h1>
        <p className={styles.subtitle}>
          {t("search.subtitle")}
        </p>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} size={18} />
          <Input
            placeholder={t("search.placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoryFilter}>
          <Select 
            value={category || "_all"} 
            onValueChange={setCategory}
          >
            <SelectTrigger className={styles.selectTrigger}>
              <div className={styles.selectLabel}>
                <Filter size={16} />
                <SelectValue placeholder={t("search.allCategories")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">{t("search.allCategories")}</SelectItem>
              {BusinessCategoryArrayValues.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={styles.results}>
        {isLoading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton style={{ height: "24px", width: "60%", marginBottom: "12px" }} />
                <Skeleton style={{ height: "16px", width: "40%", marginBottom: "24px" }} />
                <Skeleton style={{ height: "60px", width: "100%", marginBottom: "24px" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Skeleton style={{ height: "20px", width: "30%" }} />
                  <Skeleton style={{ height: "20px", width: "30%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className={styles.emptyState}>
            <p>{t("search.error")}</p>
          </div>
        ) : businesses && businesses.length > 0 ? (
          <div className={styles.grid}>
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : debouncedQuery.trim() ? (
          <div className={styles.emptyState}>
            <div className={styles.notFoundCard}>
              <div className={styles.notFoundIcon}>
                <AlertCircle size={32} />
              </div>
              <h3 className={styles.notFoundTitle}>Business not found</h3>
              <p className={styles.notFoundMessage}>
                Add <strong>"{query}"</strong> to TrueLency
              </p>
              <Button 
                onClick={handleAddBusiness}
                disabled={quickAddMutation.isPending}
                className={styles.addButton}
              >
                {quickAddMutation.isPending ? (
                  "Adding..."
                ) : (
                  <>
                    <Plus size={18} />
                    Add Business
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setQuery("");
                  setCategory("_all");
                }}
                className={styles.clearButton}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <SearchIcon size={48} />
            </div>
            <h3>{t("search.noResults")}</h3>
            <p>{t("search.noResultsHint")}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setQuery("");
                setCategory("_all");
              }}
            >
              {t("search.clearFilters")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}