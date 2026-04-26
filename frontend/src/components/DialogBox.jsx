import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogBox = ({ 
  open, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'info', 'warning'
  showIcon = true,
  actions = null,
  maxWidth = 'sm'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 style={{ color: '#4caf50' }} />;
      case 'error':
        return <AlertCircle style={{ color: '#f44336' }} />;
      case 'warning':
        return <AlertCircle style={{ color: '#ff9800' }} />;
      default:
        return <Info style={{ color: '#2196f3' }} />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  };

  const defaultActions = (
    <Button onClick={onClose} autoFocus variant="contained">
      OK
    </Button>
  );

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      maxWidth={maxWidth}
      fullWidth
    >
      <DialogTitle 
        id="dialog-title"
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: getTitleColor(),
          fontWeight: 'bold'
        }}
      >
        {showIcon && getIcon()}
        {title}
        <Button
          onClick={onClose}
          sx={{ 
            ml: 'auto', 
            minWidth: 'auto', 
            p: 0.5,
            color: 'grey.500'
          }}
        >
          <X size={20} />
        </Button>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="dialog-description" sx={{ color: 'text.primary' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        {actions || defaultActions}
      </DialogActions>
    </Dialog>
  );
};

// Hook for easy dialog management
export const useDialog = () => {
  const [dialog, setDialog] = React.useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    actions: null
  });

  const showDialog = (config) => {
    setDialog({
      open: true,
      title: config.title || 'Notification',
      message: config.message || '',
      type: config.type || 'info',
      actions: config.actions || null,
      maxWidth: config.maxWidth || 'sm'
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, open: false }));
  };

  const showSuccess = (message, title = 'Success', actions = null) => {
    showDialog({ title, message, type: 'success', actions });
  };

  const showError = (message, title = 'Error', actions = null) => {
    showDialog({ title, message, type: 'error', actions });
  };

  const showInfo = (message, title = 'Information', actions = null) => {
    showDialog({ title, message, type: 'info', actions });
  };

  const showWarning = (message, title = 'Warning', actions = null) => {
    showDialog({ title, message, type: 'warning', actions });
  };

  const DialogComponent = () => (
    <DialogBox
      open={dialog.open}
      onClose={hideDialog}
      title={dialog.title}
      message={dialog.message}
      type={dialog.type}
      actions={dialog.actions}
      maxWidth={dialog.maxWidth}
    />
  );

  return {
    showDialog,
    hideDialog,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    DialogComponent
  };
};

export default DialogBox;
