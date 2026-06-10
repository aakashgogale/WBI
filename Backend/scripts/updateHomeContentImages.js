const dotenv = require('dotenv');
const connectDB = require('../config/db');
const HomeContent = require('../models/HomeContent');

dotenv.config();

const WBIUrls = {
  "banner": [
    {
      "filename": "homepage-banner.png",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135844/WBI/HomeContent/banner/homepage-banner.png"
    },
    {
      "filename": "Winter-banner.png",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135846/WBI/HomeContent/banner/Winter-banner.png"
    }
  ],
  "curated-services": [
    {
      "filename": "ac-repair-service.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135847/WBI/HomeContent/curated-services/ac-repair-service.jpg"
    },
    {
      "filename": "electrical-panel-upgrade.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135848/WBI/HomeContent/curated-services/electrical-panel-upgrade.jpg"
    },
    {
      "filename": "home-wiring.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135849/WBI/HomeContent/curated-services/home-wiring.jpg"
    },
    {
      "filename": "smart home setup.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135850/WBI/HomeContent/curated-services/smart-home-setup.jpg"
    }
  ],
  "most-booked-services": [
    {
      "filename": "automatic-top-load-machine.webp",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135851/WBI/HomeContent/most-booked-services/automatic-top-load-machine.webp"
    },
    {
      "filename": "dreill&hang.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135852/WBI/HomeContent/most-booked-services/dreill-hang.webp"
    },
    {
      "filename": "fan-repairs.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135853/WBI/HomeContent/most-booked-services/fan-repairs.webp"
    },
    {
      "filename": "haircut-men.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135854/WBI/HomeContent/most-booked-services/haircut-men.webp"
    },
    {
      "filename": "intense-bathroom-2.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135855/WBI/HomeContent/most-booked-services/intense-bathroom-2.webp"
    },
    {
      "filename": "intense-bathroom-3.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135856/WBI/HomeContent/most-booked-services/intense-bathroom-3.webp"
    },
    {
      "filename": "roll-on-wax.webp",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135857/WBI/HomeContent/most-booked-services/roll-on-wax.webp"
    },
    {
      "filename": "spacula-waxing.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135858/WBI/HomeContent/most-booked-services/spacula-waxing.webp"
    },
    {
      "filename": "switch-board.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135859/WBI/HomeContent/most-booked-services/switch-board.webp"
    },
    {
      "filename": "tap-repai.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135860/WBI/HomeContent/most-booked-services/tap-repai.webp"
    }
  ],
  "new-and-noteworthy": [
    {
      "filename": "ac-repair.png",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135862/WBI/HomeContent/new-and-noteworthy/ac-repair.png"
    },
    {
      "filename": "bathroom-cleaning.png",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135863/WBI/HomeContent/new-and-noteworthy/bathroom-cleaning.png"
    },
    {
      "filename": "hair-studio.png",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135864/WBI/HomeContent/new-and-noteworthy/hair-studio.png"
    },
    {
      "filename": "water-purifiers.png",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135865/WBI/HomeContent/new-and-noteworthy/water-purifiers.png"
    }
  ],
  "promo-carousel": [
    {
      "filename": "1678450687690-81f922.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135866/WBI/HomeContent/promo-carousel/1678450687690-81f922.webp"
    },
    {
      "filename": "1678454437383-aa4984.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135868/WBI/HomeContent/promo-carousel/1678454437383-aa4984.webp"
    },
    {
      "filename": "1711428209166-2d42c0.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135869/WBI/HomeContent/promo-carousel/1711428209166-2d42c0.webp"
    },
    {
      "filename": "1745822547742-760034.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135870/WBI/HomeContent/promo-carousel/1745822547742-760034.webp"
    },
    {
      "filename": "1762785595543-540198.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135871/WBI/HomeContent/promo-carousel/1762785595543-540198.webp"
    },
    {
      "filename": "1764052270908-bae94c.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135873/WBI/HomeContent/promo-carousel/1764052270908-bae94c.webp"
    }
  ],
  "electrical-installation-repair": [
    {
      "filename": "home-wiring.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135874/WBI/HomeContent/electrical-installation-repair/home-wiring.jpg"
    },
    {
      "filename": "electrical-panel-upgrade.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135875/WBI/HomeContent/electrical-installation-repair/electrical-panel-upgrade.jpg"
    },
    {
      "filename": "smart home setup.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135876/WBI/HomeContent/electrical-installation-repair/smart-home-setup.jpg"
    }
  ],
  "appliance-repair-service": [
    {
      "filename": "ac-repair.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135877/WBI/HomeContent/appliance-repair-service/ac-repair.jpg"
    },
    {
      "filename": "washing-machine-repair].jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135878/WBI/HomeContent/appliance-repair-service/washing-machine-repair-.jpg"
    },
    {
      "filename": "water heater repair.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135879/WBI/HomeContent/appliance-repair-service/water-heater-repair.jpg"
    }
  ],
  "home-repair-installation": [
    {
      "filename": "wiring.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135880/WBI/HomeContent/home-repair-installation/wiring.jpg"
    },
    {
      "filename": "switch&socket.jpg",
      "url": "https://res.cloudinary.com/shubhamcloudinary/image/upload/v1766135884/WBI/HomeContent/home-repair-installation/switch-socket.jpg"
    }
  ]
};

const updateHomeContentImages = async () => {
  try {
    console.log('ðŸ”Œ Connecting to MongoDB...');
    await connectDB();
    console.log('âœ… Connected to MongoDB\n');

    // Find existing HomeContent
    const homeContent = await HomeContent.findOne();
    if (!homeContent) {
      console.log('âŒ No HomeContent found in database');
      return;
    }

    console.log('ðŸ“ Updating HomeContent images with WBI URLs...\n');

    // Update banners if they exist
    if (homeContent.banners && homeContent.banners.length > 0) {
      console.log('ðŸ“¸ Updating banners...');
      homeContent.banners.forEach((banner, index) => {
        if (WBIUrls.banner && WBIUrls.banner[index]) {
          banner.imageUrl = WBIUrls.banner[index].url;
          console.log(`  âœ… Banner ${index + 1}: ${WBIUrls.banner[index].url}`);
        }
      });
    }

    // Update promos if they exist
    if (homeContent.promos && homeContent.promos.length > 0) {
      console.log('ðŸŽ  Updating promos...');
      homeContent.promos.forEach((promo, index) => {
        if (WBIUrls['promo-carousel'] && WBIUrls['promo-carousel'][index]) {
          promo.imageUrl = WBIUrls['promo-carousel'][index].url;
          console.log(`  âœ… Promo ${index + 1}: ${WBIUrls['promo-carousel'][index].url}`);
        }
      });
    }

    // Update curated services if they exist
    if (homeContent.curated && homeContent.curated.length > 0) {
      console.log('ðŸŽ¯ Updating curated services...');
      homeContent.curated.forEach((item, index) => {
        if (WBIUrls['curated-services'] && WBIUrls['curated-services'][index]) {
          item.gifUrl = WBIUrls['curated-services'][index].url;
          console.log(`  âœ… Curated ${index + 1}: ${WBIUrls['curated-services'][index].url}`);
        }
      });
    }

    // Update noteworthy services if they exist
    if (homeContent.noteworthy && homeContent.noteworthy.length > 0) {
      console.log('â­ Updating noteworthy services...');
      homeContent.noteworthy.forEach((item, index) => {
        if (WBIUrls['new-and-noteworthy'] && WBIUrls['new-and-noteworthy'][index]) {
          item.imageUrl = WBIUrls['new-and-noteworthy'][index].url;
          console.log(`  âœ… Noteworthy ${index + 1}: ${WBIUrls['new-and-noteworthy'][index].url}`);
        }
      });
    }

    // Update most booked services if they exist
    if (homeContent.booked && homeContent.booked.length > 0) {
      console.log('ðŸ“¦ Updating most booked services...');
      homeContent.booked.forEach((item, index) => {
        if (WBIUrls['most-booked-services'] && WBIUrls['most-booked-services'][index]) {
          item.imageUrl = WBIUrls['most-booked-services'][index].url;
          console.log(`  âœ… Booked ${index + 1}: ${WBIUrls['most-booked-services'][index].url}`);
        }
      });
    }

    // Update category sections if they exist
    if (homeContent.categorySections && homeContent.categorySections.length > 0) {
      console.log('ðŸ“‚ Updating category sections...');
      homeContent.categorySections.forEach((section, sectionIndex) => {
        let sectionKey = '';
        if (section.title === 'Electrical Installation & Repair') {
          sectionKey = 'electrical-installation-repair';
        } else if (section.title === 'Appliance repair & service') {
          sectionKey = 'appliance-repair-service';
        } else if (section.title === 'Home repair & installation') {
          sectionKey = 'home-repair-installation';
        }

        if (sectionKey && WBIUrls[sectionKey] && section.cards) {
          section.cards.forEach((card, cardIndex) => {
            if (WBIUrls[sectionKey][cardIndex]) {
              card.imageUrl = WBIUrls[sectionKey][cardIndex].url;
              console.log(`  âœ… ${section.title} - Card ${cardIndex + 1}: ${WBIUrls[sectionKey][cardIndex].url}`);
            }
          });
        }
      });
    }

    // Save the updated HomeContent
    await homeContent.save();
    console.log('\nðŸŽ‰ HomeContent images updated successfully!');
    console.log('âœ… All homepage images now use WBI/HomeContent URLs');

  } catch (error) {
    console.error('âŒ Error updating HomeContent:', error);
  } finally {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('\nðŸ”Œ Database connection closed');
  }
};

updateHomeContentImages();
