const Worker = require('../../models/Worker');

exports.getMatchingWorkers = async (req, res) => {
  try {
    const { category, subServiceId, city, pincode, skills, brands } = req.query;

    // Build the matching query
    const query = {
      roleType: 'Worker',
      approvalStatus: 'approved' // Only show approved workers
    };

    if (category) {
      query.serviceCategories = { $in: [category] };
    }

    if (subServiceId) {
      query['subServices.subServiceId'] = subServiceId;
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (pincode) {
      query['address.pincode'] = pincode;
    }

    let workers = await Worker.find(query)
      .select('name profilePic rating completedJobs serviceCategories subServices address availability verifiedBadge')
      .lean();

    // In-memory filtering for array intersections (skills, brands)
    if (skills || brands) {
      const targetSkills = skills ? skills.split(',').map(s => s.trim().toLowerCase()) : [];
      const targetBrands = brands ? brands.split(',').map(b => b.trim().toLowerCase()) : [];

      workers = workers.filter(w => {
        let matchesSkills = true;
        let matchesBrands = true;

        if (subServiceId) {
          const wSub = w.subServices?.find(s => s.subServiceId?.toString() === subServiceId);
          if (!wSub) return false;

          // If filtering by skills, the worker must have at least one of the target skills
          if (targetSkills.length > 0) {
            const wSkills = [
              ...(wSub.skills || []).map(s => s.toLowerCase()),
              ...(wSub.customSkills || []).map(cs => cs.name.toLowerCase())
            ];
            matchesSkills = targetSkills.some(ts => wSkills.includes(ts));
          }

          // If filtering by brands, the worker must have at least one of the target brands
          if (targetBrands.length > 0) {
            const wBrands = (wSub.brandsHandled || []).map(b => b.toLowerCase());
            matchesBrands = targetBrands.some(tb => wBrands.includes(tb));
          }
        }

        return matchesSkills && matchesBrands;
      });
    }

    // Sort by rating and completedJobs
    workers.sort((a, b) => {
      if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
      return (b.completedJobs || 0) - (a.completedJobs || 0);
    });

    res.json({
      success: true,
      count: workers.length,
      workers
    });
  } catch (error) {
    console.error('Error fetching matching workers:', error);
    res.status(500).json({ success: false, message: 'Server error fetching workers' });
  }
};
