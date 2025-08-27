/* eslint-disable react/prop-types */
// components/EnhancedOrderTimeline.jsx
import { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  Settings, 
  Truck, 
  Home,
  Check,
  MapPin,
  Calendar
} from 'lucide-react';

const EnhancedOrderTimeline = ({ status, createdAt, deliveryDate, trackingNumber }) => {
  const [animatedSteps, setAnimatedSteps] = useState([]);
  
  const steps = [
    { 
      key: 'pending', 
      label: 'Order Placed', 
      icon: Package,
      description: 'Your order has been received',
      time: createdAt
    },
    { 
      key: 'confirmed', 
      label: 'Confirmed', 
      icon: CheckCircle,
      description: 'Seller has processed your order'
    },
    { 
      key: 'processing', 
      label: 'Processing', 
      icon: Settings,
      description: 'Item is being prepared for shipment'
    },
    { 
      key: 'shipped', 
      label: 'Shipped', 
      icon: Truck,
      description: 'Item has been dispatched',
      showTracking: true
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: Home,
      description: 'Item has been delivered',
      time: deliveryDate
    }
  ];

  const statusIndex = steps.findIndex(step => step.key === status);
  const estimatedDelivery = deliveryDate 
    ? new Date(deliveryDate) 
    : new Date(new Date(createdAt).setDate(new Date(createdAt).getDate() + 7));

  useEffect(() => {
    // Animate steps one by one
    const animateSteps = async () => {
      for (let i = 0; i <= statusIndex; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setAnimatedSteps(prev => [...prev, i]);
      }
    };
    
    animateSteps();
  }, [statusIndex]);

  const getStepStatus = (index) => {
    if (index < statusIndex) return 'completed';
    if (index === statusIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
        <Truck className="h-5 w-5 text-blue-600" />
        Order Journey
      </h3>
      
      <div className="space-y-6">
        {/* Timeline */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 -z-1 ml-4" />
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const stepStatus = getStepStatus(index);
              const isAnimated = animatedSteps.includes(index);
              
              return (
                <div key={step.key} className="flex items-start gap-4 relative">
                  {/* Icon circle */}
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                    relative z-10 transition-all duration-500
                    ${stepStatus === 'completed' ? 'bg-green-500 text-white shadow-lg' : 
                      stepStatus === 'current' ? 'bg-blue-500 text-white shadow-lg animate-bounce' : 
                      'bg-gray-200 text-gray-500'}
                    ${isAnimated ? 'scale-110' : 'scale-100'}
                  `}>
                    {stepStatus === 'completed' ? (
                      <Check size={16} className="animate-ping-once" />
                    ) : (
                      <StepIcon size={16} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`
                    flex-1 bg-gray-50 rounded-lg p-4 transition-all duration-500
                    ${isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
                    ${stepStatus === 'current' ? 'border-l-4 border-blue-500' : ''}
                  `}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`
                        font-medium
                        ${stepStatus === 'completed' ? 'text-green-700' : 
                          stepStatus === 'current' ? 'text-blue-700' : 
                          'text-gray-600'}
                      `}>
                        {step.label}
                      </h4>
                      {stepStatus === 'current' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    {step.time && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={12} />
                        {new Date(step.time).toLocaleDateString()}
                      </div>
                    )}
                    
                    {step.showTracking && trackingNumber && stepStatus !== 'upcoming' && (
                      <div className="mt-2 p-2 bg-white rounded border text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin size={12} />
                          Tracking: {trackingNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery estimation */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Expected Delivery</p>
              <p className="text-sm text-blue-700">
                {estimatedDelivery.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOrderTimeline;