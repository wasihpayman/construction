import React from 'react';
import DialogBox, { useDialog } from './DialogBox';

// Example 1: Basic usage with hook
function ExampleComponent() {
  const { showSuccess, showError, showInfo, showWarning, DialogComponent } = useDialog();

  const handleSuccess = () => {
    showSuccess('Operation completed successfully!', 'Success');
  };

  const handleError = () => {
    showError('Something went wrong. Please try again.', 'Error');
  };

  const handleInfo = () => {
    showInfo('Here is some important information for you.', 'Information');
  };

  const handleWarning = () => {
    showWarning('Please be careful with this action.', 'Warning');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={handleWarning}>Show Warning</button>
      
      {/* Don't forget to include the DialogComponent */}
      <DialogComponent />
    </div>
  );
}

// Example 2: Custom dialog with actions
function CustomDialogExample() {
  const { showDialog, DialogComponent } = useDialog();

  const handleCustomDialog = () => {
    const customActions = (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => console.log('Cancelled')} style={{ padding: '8px 16px' }}>
          Cancel
        </button>
        <button 
          onClick={() => console.log('Confirmed')} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4caf50', 
            color: 'white', 
            border: 'none' 
          }}
        >
          Confirm
        </button>
      </div>
    );

    showDialog({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed with this action?',
      type: 'warning',
      actions: customActions,
      maxWidth: 'md'
    });
  };

  return (
    <div>
      <button onClick={handleCustomDialog}>Show Custom Dialog</button>
      <DialogComponent />
    </div>
  );
}

// Example 3: Direct DialogBox usage (without hook)
function DirectDialogExample() {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)}>Show Direct Dialog</button>
      
      <DialogBox
        open={open}
        onClose={() => setOpen(false)}
        title="Direct Dialog"
        message="This is a direct usage of the DialogBox component."
        type="info"
        maxWidth="sm"
      />
    </div>
  );
}

export { ExampleComponent, CustomDialogExample, DirectDialogExample };
