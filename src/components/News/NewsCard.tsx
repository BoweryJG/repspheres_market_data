import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip,
  Link,
  CardActionArea
} from '@mui/material';
import { format, parseISO } from 'date-fns';

interface NewsCardProps {
  id: number;
  title: string;
  summary: string;
  image_url?: string;
  published_date: string;
  source: string;
  author?: string;
  url?: string;
  industry: 'dental' | 'aesthetic';
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  summary,
  image_url,
  source,
  published_date,
  url,
  industry,
  author
}) => {
  // Format the date
  const formattedDate = published_date ? 
    (typeof published_date === 'string' ? 
      format(parseISO(published_date), 'MMM d, yyyy') : 
      format(published_date, 'MMM d, yyyy')
    ) : '';

  const defaultImage = industry === 'dental' 
    ? 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1000&auto=format&fit=crop' 
    : 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1000&auto=format&fit=crop';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component="a" href={url || '#'} target="_blank" rel="noopener noreferrer">
        <CardMedia
          component="img"
          height="140"
          image={image_url || defaultImage}
          alt={title}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {summary}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Typography variant="caption" color="text.secondary">
              {source} • {formattedDate}
            </Typography>
            
            <Chip 
              label={industry === 'dental' ? 'Dental' : 'Aesthetic'} 
              size="small" 
              color={industry === 'dental' ? 'primary' : 'secondary'}
              variant="outlined"
              sx={{ ml: 1 }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default NewsCard;
