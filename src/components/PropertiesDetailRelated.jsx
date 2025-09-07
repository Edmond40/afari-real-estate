import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { formatCurrency } from '../lib/format';

function PropertiesDetailRelated({ listing }){
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const criteria = useMemo(() => {
        if (!listing) return null;
        const type = listing.type || listing.propertyType || '';
        const city = listing.city || '';
        return { type, city };
    }, [listing]);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!listing) return;
            setLoading(true);
            setError(null);
            try {
                // Prefer same type; fallback to city
                const params = new URLSearchParams();
                if (criteria?.type) params.append('type', criteria.type);
                if (!criteria?.type && criteria?.city) params.append('city', criteria.city);
                params.append('limit', '20');

                const { data } = await api.get(`/listings?${params.toString()}`);
                const items = data?.data?.listings || data?.listings || [];
                const filtered = items
                  .filter((p) => p.id !== listing.id)
                  .filter((p) => {
                      const byType = criteria?.type && (p.type === criteria.type || p.propertyType === criteria.type);
                      const byCity = criteria?.city && p.city === criteria.city;
                      return byType || byCity;
                  })
                  .slice(0, 4);
                setRelated(filtered);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRelated();
    }, [listing, criteria]);

    if (!listing) return null;

    if (loading) return null;
    if (error) return null;

    return(
        <div>
            {related.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-right">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Similar Properties</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {related.map((item) => {
                            const title = item.title || item.name || 'Property';
                            const location = item.location || [item.city, item.state].filter(Boolean).join(', ');
                            const image = (Array.isArray(item.images) && item.images[0]) || item.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=100&q=80';
                            return (
                                <Link
                                    key={item.id}
                                    to={`/properties-detail-page/${item.id}`}
                                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={typeof image === 'string' ? image : image.url || image.src}
                                            alt={title}
                                            className="w-16 h-16 rounded-md object-cover"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{title}</h3>
                                            <p className="text-sm text-gray-600">{location}</p>
                                            <p className="text-sm font-semibold text-blue-600">
                                                {formatCurrency(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PropertiesDetailRelated;