'use client';

import {
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import {
  IconMapPin,
  IconEdit,
  IconTrash,
  IconHome,
  IconBuilding,
  IconMap,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { UserLocation } from '@/interfaces';

interface LocationsListProps {
  userId: string;
}

export function LocationsList({ userId }: LocationsListProps) {
  const { data: locations = [] } = useQuery<UserLocation[]>({
    queryKey: ['user-locations', userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${userId}/locations`);
      return response.data;
    },
  });

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'home':
        return IconHome;
      case 'work':
        return IconBuilding;
      default:
        return IconMapPin;
    }
  };

  const getLocationTypeName = (type: string) => {
    switch (type) {
      case 'home':
        return 'المنزل';
      case 'work':
        return 'العمل';
      default:
        return 'آخر';
    }
  };

  if (locations.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography color="text.secondary">
          لا توجد عناوين محفوظة
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {locations.map((location) => {
        const LocationIcon = getLocationIcon(location.type);
        return (
          <Grid item xs={12} sm={6} md={4} key={location.id}>
            <Paper
              sx={{
                p: 2,
                position: 'relative',
                height: '100%',
              }}
            >
              {location.isDefault && (
                <Chip
                  label="العنوان الافتراضي"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                  }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    flexShrink: 0,
                  }}
                >
                  <LocationIcon size={20} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {location.name}
                  </Typography>
                  <Chip
                    label={getLocationTypeName(location.type)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" color="info">
                    <IconEdit size={16} />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <IconTrash size={16} />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {location.address}
              </Typography>
              {location.notes && (
                <Typography variant="caption" color="text.secondary" display="block">
                  ملاحظات: {location.notes}
                </Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                      '_blank'
                    );
                  }}
                >
                  <IconMap size={16} />
                </IconButton>
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
} 