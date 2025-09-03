import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Crown, Zap } from 'lucide-react';

const Premium = () => {
  const plans = [
    {
      name: 'Basic',
      price: 0,
      period: 'Free',
      features: [
        'Access to free courses',
        'Basic community support',
        'Course completion certificates',
        'Limited video quality'
      ]
    },
    {
      name: 'Premium',
      price: 29,
      period: 'month',
      featured: true,
      features: [
        'All free course features',
        'Access to premium courses',
        'HD video quality',
        'Priority support',
        'Downloadable content',
        'Progress tracking',
        '1-on-1 mentoring sessions',
        'Industry certificates'
      ]
    },
    {
      name: 'Pro',
      price: 99,
      period: 'month',
      features: [
        'All Premium features',
        'Unlimited course access',
        '4K video quality',
        'Personal learning path',
        'Live workshops',
        'Direct instructor access',
        'Career guidance',
        'Job placement assistance'
      ]
    }
  ];

  return (
    <div className="premium-page">
      <div className="premium-header">
        <h1>Choose Your Learning Journey</h1>
        <p style={{ fontSize: '1.2rem', color: '#4a5568', maxWidth: '600px', margin: '0 auto' }}>
          Unlock your potential with our premium plans. Get access to exclusive content, 
          personalized learning, and career support.
        </p>
      </div>

      <div className="plans-grid">
        {plans.map((plan, index) => (
          <div key={index} className={`plan-card ${plan.featured ? 'featured' : ''}`}>
            {plan.featured && <Crown color="#3b82f6" size={32} style={{ marginBottom: '1rem' }} />}
            
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">
              ${plan.price}
              {plan.price > 0 && (
                <span style={{ fontSize: '1rem', color: '#718096' }}>/{plan.period}</span>
              )}
              {plan.price === 0 && (
                <span style={{ fontSize: '1rem', color: '#718096' }}> Forever</span>
              )}
            </div>
            
            <ul className="plan-features">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} color="#10b981" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <Link 
              to={plan.price === 0 ? "/courses" : "/signup"} 
              className={`btn-large ${plan.featured ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                display: 'block', 
                textAlign: 'center', 
                textDecoration: 'none',
                width: '100%'
              }}
            >
              {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
            </Link>
          </div>
        ))}
      </div>

      {/* Premium Benefits */}
      <section style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        borderRadius: '12px',
        margin: '4rem 0',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
          Why Go Premium?
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem',
          marginTop: '3rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Star size={48} style={{ marginBottom: '1rem', color: '#f59e0b' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Premium Content</h3>
            <p style={{ opacity: 0.9 }}>Access to exclusive courses and advanced tutorials</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Zap size={48} style={{ marginBottom: '1rem', color: '#10b981' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Faster Learning</h3>
            <p style={{ opacity: 0.9 }}>Accelerated learning with personalized paths</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Crown size={48} style={{ marginBottom: '1rem', color: '#8b5cf6' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Career Support</h3>
            <p style={{ opacity: 0.9 }}>Get career guidance and job placement assistance</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2d3748' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#2d3748' }}>Can I cancel anytime?</h3>
            <p style={{ color: '#4a5568' }}>Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#2d3748' }}>Do you offer refunds?</h3>
            <p style={{ color: '#4a5568' }}>We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.</p>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#2d3748' }}>Can I upgrade or downgrade?</h3>
            <p style={{ color: '#4a5568' }}>Yes, you can change your plan at any time. Changes will take effect at your next billing cycle.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Premium;
