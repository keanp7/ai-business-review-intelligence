import React, { useState } from "react";
import { useAdminUsers } from "../helpers/useAdminApi";
import { useI18n } from "../helpers/i18n";
import { Button } from "./Button";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import { Search } from "lucide-react";
import { useDebounce } from "../helpers/useDebounce";
import styles from "./AdminShared.module.css";

export function AdminUsersTab() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const { data, isFetching } = useAdminUsers({
    page,
    limit: 10,
    search: debouncedSearch,
  });

  return (
    <div className={styles.tabContainer}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={16} />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>User</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Role</th>
              <th className={styles.th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {isFetching && !data ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={styles.td}><Skeleton className="h-4 w-32" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-48" /></td>
                  <td className={styles.td}><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className={styles.td}><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))
            ) : data?.users.length === 0 ? (
              <tr className={styles.tr}>
                <td colSpan={4} className={`${styles.td} text-center py-8 text-muted-foreground`}>
                  {t("admin.noData")}
                </td>
              </tr>
            ) : (
              data?.users.map((user) => (
                <tr key={user.id} className={styles.tr}>
                  <td className={`${styles.td} font-medium`}>{user.displayName}</td>
                  <td className={styles.td}>{user.email}</td>
                  <td className={styles.td}>
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || isFetching}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil((data?.total || 0) / 10) || 1}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setPage(p => p + 1)}
          disabled={!data || page >= Math.ceil(data.total / 10) || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  );
}