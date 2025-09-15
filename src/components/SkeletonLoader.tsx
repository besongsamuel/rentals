import { Box, Container, Paper, Skeleton } from "@mui/material";
import React from "react";

interface SkeletonLoaderProps {
  variant?: "form" | "dashboard" | "list" | "card";
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = "form",
}) => {
  const renderFormSkeleton = () => (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          mt: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 4 }} />

        <Box sx={{ width: "100%" }}>
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={36} sx={{ mb: 2 }} />
        </Box>
      </Paper>
    </Container>
  );

  const renderDashboardSkeleton = () => (
    <Box sx={{ flexGrow: 1 }}>
      <Skeleton variant="rectangular" height={64} />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Paper>
      </Container>
    </Box>
  );

  const renderListSkeleton = () => (
    <Box sx={{ width: "100%" }}>
      {[...Array(5)].map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={40} />
          </Paper>
        </Box>
      ))}
    </Box>
  );

  const renderCardSkeleton = () => (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {[...Array(3)].map((_, index) => (
        <Paper key={index} elevation={2} sx={{ p: 2, minWidth: 200, flex: 1 }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={120}
            sx={{ mb: 2 }}
          />
          <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </Paper>
      ))}
    </Box>
  );

  switch (variant) {
    case "dashboard":
      return renderDashboardSkeleton();
    case "list":
      return renderListSkeleton();
    case "card":
      return renderCardSkeleton();
    case "form":
    default:
      return renderFormSkeleton();
  }
};

export default SkeletonLoader;


