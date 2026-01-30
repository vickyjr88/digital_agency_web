/**
 * Campaign Detail Router
 * Intelligently routes to the correct campaign detail component based on campaign type
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import CampaignDetail from './CampaignDetail';
import OpenCampaignDetail from '../OpenCampaigns/OpenCampaignDetail';
import { Loader2 } from 'lucide-react';

export default function CampaignDetailRouter() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isOpenCampaign, setIsOpenCampaign] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkCampaignType();
    }, [campaignId]);

    const checkCampaignType = async () => {
        setLoading(true);
        setError(null);

        try {
            // Try to fetch as open campaign first (public endpoint)
            const data = await api.getOpenCampaign(campaignId);
            setIsOpenCampaign(true);
        } catch (err) {
            // If it fails, it's a regular campaign
            setIsOpenCampaign(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9fafb'
            }}>
                <Loader2 className="animate-spin" size={48} style={{ color: '#4f46e5', marginBottom: '1rem' }} />
                <p style={{ color: '#6b7280' }}>Loading campaign...</p>
            </div>
        );
    }

    // Render the appropriate component based on campaign type
    return isOpenCampaign ? <OpenCampaignDetail /> : <CampaignDetail />;
}
