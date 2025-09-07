import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProperties,
      activeListings,
      totalAgents,
      totalInquiries,
      pendingInquiries
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.listing.count().catch(() => 0),
      prisma.listing.count({ where: { status: 'FOR_SALE' } }).catch(() => 0),
      prisma.agent.count().catch(() => 0),
      prisma.inquiry.count().catch(() => 0),
      prisma.inquiry.count({ where: { status: 'PENDING' } }).catch(() => 0)
    ]);

    const stats = {
      infoCards: [
        {
          Title: "Total Users",
          Users: totalUsers.toString()
        },
        {
          Title: "Total Properties", 
          Users: totalProperties.toString()
        },
        {
          Title: "Active Listings",
          Users: activeListings.toString()
        },
        {
          Title: "Total Agents",
          Users: totalAgents.toString()
        }
      ],
      userCardStat: [
        {
          Title: "Active Listings",
          Users: activeListings
        },
        {
          Title: "Total Properties",
          Users: totalProperties
        },
        {
          Title: "Inquiries",
          Users: totalInquiries
        },
        {
          Title: "Pending Inquiries", 
          Users: pendingInquiries
        },
        {
          Title: "Total Agents",
          Users: totalAgents
        },
        {
          Title: "Total Users",
          Users: totalUsers
        }
      ]
    };

    res.json(stats);
  } catch (e) { 
    console.error('Dashboard stats error:', e);
    // Return default stats if database query fails
    res.json({
      infoCards: [
        { Title: "Total Users", Users: "0" },
        { Title: "Total Properties", Users: "0" },
        { Title: "Active Listings", Users: "0" },
        { Title: "Total Agents", Users: "0" }
      ],
      userCardStat: [
        { Title: "Active Listings", Users: 0 },
        { Title: "Total Properties", Users: 0 },
        { Title: "Inquiries", Users: 0 },
        { Title: "Pending Inquiries", Users: 0 },
        { Title: "Total Agents", Users: 0 },
        { Title: "Total Users", Users: 0 }
      ]
    });
  }
});

// GET /api/dashboard/saved-properties - Get saved properties for current user
router.get('/saved-properties', async (req, res) => {
  try {
    // For now, return recent active listings as "saved" properties
    // In a real app, you'd have a SavedProperty model linked to users
    const properties = await prisma.listing.findMany({
      where: { status: 'FOR_SALE' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        city: true,
        images: true
      }
    }).catch(() => []);

    const savedProperties = properties.map(property => ({
      id: property.id,
      Title: property.title,
      Price: property.price,
      Location: property.city,
      Image: property.images && Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : '/optimized-images/default-property.webp'
    }));

    res.json({ savedProperties });
  } catch (e) { 
    console.error('Saved properties error:', e);
    res.json({ savedProperties: [] });
  }
});

export default router;
