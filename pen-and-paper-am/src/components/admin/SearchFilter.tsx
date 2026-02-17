import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';

export type ContentType = 'all' | 'courses' | 'faq' | 'announcements' | 'team';
export type SortOrder = 'asc' | 'desc';
export type SortBy = 'title' | 'date' | 'views';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterType: (type: ContentType) => void;
  onSort: (sortBy: SortBy, order: SortOrder) => void;
  currentType?: ContentType;
  placeholder?: string;
}

export const SearchFilter = ({
  onSearch,
  onFilterType,
  onSort,
  currentType = 'all',
  placeholder = 'Search...'
}: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleTypeChange = (type: ContentType) => {
    onFilterType(type);
  };

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      onSort(sortBy, newOrder);
    } else {
      setSortBy(newSortBy);
      onSort(newSortBy, sortOrder);
    }
  };

  const activeFilters = useMemo(() => {
    const filters: string[] = [];
    if (currentType !== 'all') filters.push(currentType);
    if (searchQuery) filters.push(`search: "${searchQuery}"`);
    return filters;
  }, [currentType, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Select value={currentType} onValueChange={(v) => handleTypeChange(v as ContentType)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="courses">Courses</SelectItem>
            <SelectItem value="faq">FAQ</SelectItem>
            <SelectItem value="announcements">Announcements</SelectItem>
            <SelectItem value="team">Team Members</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={sortBy} onValueChange={(v) => handleSortChange(v as SortBy)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="views">Views</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => {
              const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
              setSortOrder(newOrder);
              onSort(sortBy, newOrder);
            }}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {filter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  if (filter.startsWith('search:')) {
                    handleClear();
                  } else {
                    handleTypeChange('all');
                  }
                }}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleClear();
              handleTypeChange('all');
            }}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

