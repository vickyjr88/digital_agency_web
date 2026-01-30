import { Link } from 'react-router-dom';

// Parties Card Component
export const PartiesCard = ({ campaign }) => {
    return (
        <div className="parties-card">
            <h4>👥 Parties</h4>

            <div className="party">
                <span className="role">Brand</span>
                <div className="party-info">
                    <div className="party-avatar">
                        {campaign.brand_entity?.logo_url ? (
                            <img src={campaign.brand_entity.logo_url} alt={campaign.brand_entity.name} />
                        ) : (
                            (campaign.brand_entity?.name || campaign.brand?.name || 'B').charAt(0)
                        )}
                    </div>
                    <div className="party-details">
                        <span className="party-name">{campaign.brand_entity?.name || campaign.brand?.name || 'Brand'}</span>
                        {campaign.brand_entity?.industry && (
                            <span className="party-subtext">{campaign.brand_entity.industry}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="party">
                <span className="role">Influencer</span>
                <Link to={`/marketplace/influencer/${campaign.influencer?.id}`} className="party-info">
                    <div className="party-avatar">
                        {campaign.influencer?.display_name?.charAt(0) || 'I'}
                    </div>
                    <div className="party-details">
                        <span className="party-name">{campaign.influencer?.display_name || 'Influencer'}</span>
                        <span className="party-subtext">@{campaign.influencer?.niche || 'Creator'}</span>
                    </div>
                </Link>
            </div>
        </div>
    );
};

// Package Info Card Component
export const PackageInfoCard = ({ campaign, formatPrice }) => {
    if (!campaign.package) return null;

    return (
        <div className="package-info-card">
            <h4>📦 Selected Package</h4>
            <Link to={`/marketplace/package/${campaign.package.id}`} className="package-link">
                <span className="pkg-name">{campaign.package.name}</span>
                <ul className="pkg-includes">
                    <li>✓ {campaign.package.deliverables_count} Deliverables</li>
                    <li>✓ {campaign.package.revisions_included} Revisions</li>
                    <li>✓ {campaign.package.timeline_days} Days Timeline</li>
                </ul>
                <span className="pkg-price">{formatPrice(campaign.package.price)}</span>
            </Link>
        </div>
    );
};
