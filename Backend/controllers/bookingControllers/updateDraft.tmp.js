// 7. Update Draft (Address & Schedule)
exports.updateDraft = async (req, res) => {
  try {
    const draftId = req.params.id;
    const { bookingType, address, scheduledDate, scheduledTime } = req.body;
    const userId = req.user._id || req.user.id;

    const draft = await BookingDraft.findOne({ _id: draftId, userId });
    
    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found' });
    }

    draft.bookingType = bookingType;
    draft.address = address;
    draft.scheduledDate = scheduledDate;
    draft.scheduledTime = scheduledTime;

    await draft.save();

    res.status(200).json({ success: true, data: draft, message: 'Draft updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
