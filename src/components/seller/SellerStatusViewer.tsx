import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Clock } from 'lucide-react';
import { SellerStatus } from '@/hooks/useSellerStatuses';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SellerStatusViewerProps {
  statuses: SellerStatus[];
  initialIndex?: number;
  onClose: () => void;
  onDelete?: (statusId: string) => void;
  isOwner?: boolean;
  storeName?: string;
  storeLogo?: string;
}

export function SellerStatusViewer({
  statuses,
  initialIndex = 0,
  onClose,
  onDelete,
  isOwner = false,
  storeName,
  storeLogo,
}: SellerStatusViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const currentStatus = statuses[currentIndex];

  useEffect(() => {
    setProgress(0);
    const duration = 5000; // 5 seconds per status
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < statuses.length - 1) {
            setCurrentIndex(i => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, statuses.length, onClose]);

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setProgress(0);
    }
  };

  const goToNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(i => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m restantes`;
    }
    return `${diffMinutes}m restantes`;
  };

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 p-2 flex gap-1">
        {statuses.map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-75 ease-linear"
              style={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {storeLogo ? (
            <img
              src={storeLogo}
              alt={storeName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
              {storeName?.charAt(0) || 'T'}
            </div>
          )}
          <div>
            <p className="text-white font-medium text-sm">{storeName || 'Mi Tienda'}</p>
            <p className="text-white/70 text-xs">
              {formatDistanceToNow(new Date(currentStatus.created_at), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <div className="flex items-center gap-1 text-white/70 text-xs bg-black/30 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {getTimeRemaining(currentStatus.expires_at)}
            </div>
          )}
          
          {isOwner && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar estado?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDelete(currentStatus.id);
                      if (statuses.length === 1) {
                        onClose();
                      } else if (currentIndex >= statuses.length - 1) {
                        setCurrentIndex(i => i - 1);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Image */}
      <img
        src={currentStatus.image_url}
        alt="Status"
        className="max-h-full max-w-full object-contain"
      />

      {/* Caption */}
      {currentStatus.caption && (
        <div className="absolute bottom-20 left-0 right-0 px-4">
          <p className="text-white text-center text-lg font-medium drop-shadow-lg bg-black/30 py-2 px-4 rounded-lg mx-auto max-w-md">
            {currentStatus.caption}
          </p>
        </div>
      )}

      {/* Navigation areas */}
      <button
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1/4 flex items-center justify-start pl-4"
        disabled={currentIndex === 0}
      >
        {currentIndex > 0 && (
          <ChevronLeft className="h-8 w-8 text-white/50 hover:text-white" />
        )}
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-1/2 w-1/4 flex items-center justify-end pr-4"
      >
        <ChevronRight className="h-8 w-8 text-white/50 hover:text-white" />
      </button>
    </div>
  );
}
